import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  calculateQuote(orderAmount: number) {
    // All monetary values are millimes. No widget is proposed for orders <= 7 TND.
    const eligible = orderAmount > 7000;
    const raw = Math.round(orderAmount * 0.025);
    const distanceToNext5000 = raw % 5000 === 0 ? 0 : 5000 - (raw % 5000);
    const roundingStep = distanceToNext5000 < 2500 ? 5000 : 1000;
    const suggestedDonation = eligible ? Math.ceil(raw / roundingStep) * roundingStep : 0;
    return { orderAmount, eligible, percentage: 2.5, suggestedDonation, currency: 'TND' };
  }

  async createPending(input: { merchantSlug: string; orderAmount: number; donationAmount: number }) {
    if (!input.merchantSlug || !Number.isInteger(input.orderAmount) || !Number.isInteger(input.donationAmount) || input.orderAmount <= 0 || input.donationAmount <= 0) {
      throw new BadRequestException('Invalid donation details');
    }
    const quote = this.calculateQuote(input.orderAmount);
    if (!quote.eligible) throw new BadRequestException('Order is not eligible for SOS-Call');
    const merchant = await this.prisma.merchant.findUnique({ where: { slug: input.merchantSlug } });
    if (!merchant || merchant.status !== 'ACTIVE') throw new NotFoundException('Merchant is not registered or active');
    return this.prisma.donation.create({
      data: { merchantId: merchant.id, orderAmount: input.orderAmount, donationAmount: input.donationAmount, status: 'PENDING' },
      select: { id: true, orderAmount: true, donationAmount: true, status: true, currency: true },
    });
  }

  async setPaymentResult(id: string, status: 'CONFIRMED' | 'FAILED') {
    if (status !== 'CONFIRMED' && status !== 'FAILED') throw new BadRequestException('Invalid payment status');
    const donation = await this.prisma.donation.findUnique({ where: { id } });
    if (!donation) throw new NotFoundException('Donation not found');
    // Conditional update makes repeated PSP callbacks safe (idempotent).
    const reference = randomUUID();
    await this.prisma.donation.updateMany({
      where: { id, status: 'PENDING' },
      data: { status, paymentReference: status === 'CONFIRMED' ? reference : null, confirmedAt: status === 'CONFIRMED' ? new Date() : null },
    });
    return this.prisma.donation.findUnique({ where: { id }, select: { id: true, status: true, donationAmount: true, confirmedAt: true } });
  }
}

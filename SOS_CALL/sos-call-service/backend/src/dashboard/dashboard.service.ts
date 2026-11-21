import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async getOverview() {
    const [totalCollected, confirmedDonations, merchantsCount, recentDonations] = await Promise.all([
      this.prisma.donation.aggregate({ where: { status: 'CONFIRMED' }, _sum: { donationAmount: true } }),
      this.prisma.donation.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.merchant.count(),
      this.prisma.donation.findMany({ where: { status: 'CONFIRMED' }, take: 10, orderBy: { confirmedAt: 'desc' }, include: { merchant: { select: { name: true } } } }),
    ]);
    return { totalCollected: totalCollected._sum.donationAmount ?? 0, confirmedDonations, merchantsCount, recentDonations };
  }
}

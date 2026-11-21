import { Body, Controller, Param, Post } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { QuoteDto } from './dto/quote.dto';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post('quote')
  calculateQuote(@Body() dto: QuoteDto) {
    return this.donationsService.calculateQuote(dto.orderAmount);
  }

  // Called by the merchant checkout after the customer accepts the widget.
  @Post()
  createPending(@Body() body: { merchantSlug: string; orderAmount: number; donationAmount: number }) {
    return this.donationsService.createPending(body);
  }

  // DEMO ONLY: a real PSP integration must call a server-to-server verified webhook.
  @Post(':id/payment-result')
  paymentResult(@Param('id') id: string, @Body() body: { status: 'CONFIRMED' | 'FAILED' }) {
    return this.donationsService.setPaymentResult(id, body.status);
  }
}

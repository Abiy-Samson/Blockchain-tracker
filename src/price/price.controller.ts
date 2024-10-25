import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('hourly')
  async getHourlyPrices() {
    return this.priceService.getHourlyPrices();
  }

  @Get('alert')
  async setPriceAlert(
    @Query('chain') chain: string,
    @Query('dollar') dollar: number,
    @Query('email') email: string,
  ) {
    // Save the alert in a DB or handle it as needed
    return { message: `Alert set for ${chain} at ${dollar} USD, email: ${email}` };
  }
}

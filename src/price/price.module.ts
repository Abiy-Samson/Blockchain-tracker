import { Module } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service'; // Adjusted import path
import { PriceController } from './price.controller'; // Adjusted import path
import { Price } from './price.entity'; // Ensure this file exists and is correct

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}

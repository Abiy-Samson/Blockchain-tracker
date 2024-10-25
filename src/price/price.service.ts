import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Price } from './price.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
  ) {}

  async fetchPrice(chain: string): Promise<number> {
    const response = await axios.get(`https://api.moralis.io/v2/price?chain=${chain}`, {
      headers: {
        'X-API-Key': process.env.MORALIS_API_KEY, // Use your Moralis API key
      },
    });
    return response.data.price; // Adjust based on the actual response structure
  }

  @Cron('*/5 * * * *') // Runs every 5 minutes
  async handleCron() {
    const chains = ['ethereum', 'polygon'];
    for (const chain of chains) {
      const price = await this.fetchPrice(chain);
      await this.priceRepository.save({ chain, price, timestamp: new Date() });
    }
  }

  @Cron('0 * * * *') // Runs every hour
  async checkPriceIncrease() {
    const chains = ['ethereum', 'polygon'];
    for (const chain of chains) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const latestPrice = await this.priceRepository.findOne({
        where: { chain },
        order: { timestamp: 'DESC' },
      });

      const priceOneHourAgo = await this.priceRepository.findOne({
        where: { chain, timestamp: LessThan(oneHourAgo) },
        order: { timestamp: 'DESC' },
      });

      if (latestPrice && priceOneHourAgo) {
        if (latestPrice.price > priceOneHourAgo.price * 1.03) {
          await this.sendAlert(chain, latestPrice.price);
        }
      }
    }
  }

  async sendAlert(chain: string, price: number) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: 'hyperhire_assignment@hyperhire.in',
      subject: `Price Alert: ${chain}`,
      text: `The price of ${chain} has increased to $${price.toFixed(2)}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async getHourlyPrices(): Promise<Price[]> {
    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    return this.priceRepository.find({
      where: { timestamp: LessThan(oneDayAgo) },
      order: { timestamp: 'ASC' },
    });
  }
}

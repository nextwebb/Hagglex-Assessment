/* eslint-disable prettier/prettier */
import { Injectable, HttpService, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import * as path from 'path';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapingService {
  constructor(private httpService: HttpService) {}

  async scrapeURL(req: Request, query: any) {
    try {
      const { url } = query;
      const { data, status } = await this.httpService.get(`${url}`).toPromise();
      const resObj = {
        title: '',
        description: '',
        images: [],
      };

      if (status !== HttpStatus.OK) {
        return {
          code: status,
          message: 'bad request!',
          data: {},
        };
      }

      const $ = cheerio.load(data),
        $title = $('head title').text(),
        $desc = $('meta[name="description"]').attr('content'),
        $images = $('img');

      if ($title) {
        resObj.title = $title;
      }

      if ($desc) {
        resObj.description = $desc;
      }

      if ($images && $images.length) {
        resObj.images = [];

        for (let i = 0; i < $images.length; i++) {
          const etx = path.extname($($images[i]).attr('src'));
          if (
            etx === '.png' ||
            etx === '.jpg' ||
            etx === '.jpeg' ||
            etx === '.svg' ||
            etx === '.bmp'
          ) {
            resObj.images.push($($images[i]).attr('src'));
          }
        }

        return {
          code: HttpStatus.OK,
          message: `Scraped data from ${url}`,
          data: resObj,
        };
      }
    } catch (error) {
      return {
        code: 400,
        message: 'Invalid url',
        error: error.message,
      };
    }
  }
}

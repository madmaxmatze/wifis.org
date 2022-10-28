import { Get, Controller, Res, Param } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
    @Get()
    homepage(@Res() res: Response) {
        return this.pages(res, "home");
    }

    @Get('p/:page_id(about|faq|languages|login|press|tos|wifis)')
    pages(@Res() res: Response, @Param('page_id') page_id: string) {
        if (["about", "faq", "press", "tos"].includes(page_id)) {
            res.locals.cms_id = page_id;
        }

        res.locals.viewname = page_id;
        return res.render(page_id);
    }
}

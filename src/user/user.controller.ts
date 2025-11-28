import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { DynamicFormRepository } from 'src/db/dynamic-form.repository';
import { DnForm } from 'src/dtos/dnform.dto';
import { CustomValidationPipe } from 'src/utils/custom-validation.pipe';

@Controller('user')
export class UserController {

    constructor(private dynamicFormRepository: DynamicFormRepository) {
    }

    @Post('/form/define')
    async defineVendor(
        @Body(new ValidationPipe({ transform: true }))
        request: DnForm,
    ): Promise<any> {
        return await this.dynamicFormRepository.upsertForm(request);
    }
    @Post('/save')
    @UsePipes(new CustomValidationPipe('user-register'))
    async saveUser(
        @Body(new ValidationPipe({ transform: true })) request: { userId: string },
    ) {
        return { acknowledged: true }
    }

}

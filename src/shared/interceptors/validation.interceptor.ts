import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";

export class ValidationException extends BadRequestException {
    constructor(public validationErrors: any) {
        super();
    }
}

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
    catch(exception: ValidationException, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        var firstError = Object.values(exception.validationErrors).filter(x => typeof x !== undefined).shift();

        return response.status(400).json({
            message: firstError[0],
            errors: exception.validationErrors,
            statusCode: 400,
            success: false
        });
    }
}
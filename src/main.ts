import { ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { TrimStringsPipe } from './modules/common/transformer/trim-strings.pipe';
import { AppModule } from './modules/main/app.module';
import { setupSwagger } from './swagger';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { ValidationException, ValidationFilter } from './shared/interceptors/validation.interceptor';

async function bootstrap() {
  const port = process.env.APP_PORT || 3000;
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  app.enableCors();

  app.useGlobalFilters(new ValidationFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(new TrimStringsPipe(),
    new ValidationPipe({
      skipMissingProperties: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const errMsg = {};
        errors.forEach(err => {
          errMsg[err.property] = [...Object.values(err.constraints)];
        });
        return new ValidationException(errMsg);
      }
    })
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(port);
}
bootstrap();

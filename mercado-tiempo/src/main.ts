import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { crearValidationPipe } from './shared/validacion/validacion-es';
import { ErroresEsFilter } from './shared/filters/errores-es.filter';
import { CARPETA_UPLOADS, PREFIJO_UPLOADS } from './imagen/imagen.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  });
  app.enableCors();
  app.enableVersioning({
   type: VersioningType.URI,
   prefix: 'api/v',
   defaultVersion: '1',
 });
  // Errores en español: validación de los DTO y mensajes por defecto de Nest
  app.useGlobalPipes(crearValidationPipe());
  app.useGlobalFilters(new ErroresEsFilter());
  // Imágenes subidas con POST /api/v1/imagenes: se ven en http://localhost:3000/uploads/imagenes/<nombre>
  app.useStaticAssets(CARPETA_UPLOADS, { prefix: PREFIJO_UPLOADS });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

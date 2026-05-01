import { Module } from '@nestjs/common';
import { CommonsModule } from './commons/commons.module';
import { CoreModule } from './core/core.module';
import { DriversModule } from './drivers/drivers.module';
import { AdaptersModule } from './adapters/adapters.module';

@Module({
  imports: [CommonsModule, CoreModule, DriversModule, AdaptersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

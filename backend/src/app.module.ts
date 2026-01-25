import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { GroupsModule } from './groups/groups.module';
import { CalendarModule } from './calendar/calendar.module';
import { ReportingModule } from './reporting/reporting.module';
import { PaymentsModule } from './payments/payments.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReportTypesModule } from './report-types/report-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    MembersModule,
    GroupsModule,
    CalendarModule,
    ReportingModule,
    PaymentsModule,
    WorkoutsModule,
    UploadsModule,
    ReportTypesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

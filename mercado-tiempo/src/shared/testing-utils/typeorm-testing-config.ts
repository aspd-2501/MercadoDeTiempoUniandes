/* eslint-disable prettier/prettier */
/* archivo: src/shared/testing-utils/typeorm-testing-config.ts */
import { TypeOrmModule } from '@nestjs/typeorm';

export const TypeOrmTestingConfig = () => [
    TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        dropSchema: true,
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([]),
];
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './config/app-config.service';
import { AppConfigModule } from './config/config.module';
import { ListingController } from './controller/listing-controller';
import { MetadataController } from './controller/metadata-controller';
import { MintController } from './controller/mint-controller';
import { StoreModule } from './db/store.module';
import { ListedNamesModule } from './listed-names/listed-names.module';
import { MetadataModule } from './metadata/metadata.module';
import { MintSigner } from './minting/mint-signer';
import { MintingModule } from './minting/minting.module';
import { MintingService } from './minting/minting.service';
import { EnsRegistryService } from './web3/ens-registry/ens-registry.service';
import { Web3Module } from './web3/web3.module';

const nodeEnv = process.env.NODE_ENV;
const isTest = nodeEnv === 'test';

@Module({
  imports: [
    // set up configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isTest ? ['./test/.env', '.env'] : ['.env'],
    }),

    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: AppConfig) => {
        return {
          uri: config.mongoConnectionString,
        };
      },
      inject: [AppConfig],
    }),

    ListedNamesModule,
    MintingModule,
    Web3Module,
    MetadataModule,
    StoreModule,
  ],
  controllers: [MintController, ListingController, MetadataController],
  providers: [MintingService, MintSigner, AppConfig, EnsRegistryService],
})
export class AppModule {}

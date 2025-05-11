import { MigrationInterface, QueryRunner } from "typeorm";

export class PublicHCannel1746916442408 implements MigrationInterface {
    name = 'PublicHCannel1746916442408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_channels\` ADD \`IsPublic\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_channels\` DROP COLUMN \`IsPublic\``);
    }

}

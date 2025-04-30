import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteChats1745935465234 implements MigrationInterface {
    name = 'DeleteChats1745935465234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` ADD \`Deleted\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` ADD \`Deleted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` DROP COLUMN \`Deleted\``);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` DROP COLUMN \`Deleted\``);
    }

}

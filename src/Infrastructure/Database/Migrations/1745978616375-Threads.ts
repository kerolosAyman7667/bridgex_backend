import { MigrationInterface, QueryRunner } from "typeorm";

export class Threads1745978616375 implements MigrationInterface {
    name = 'Threads1745978616375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` ADD \`ReplyToId\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` ADD \`ThreadId\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` ADD \`ThreadStart\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` ADD \`ThreadId\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` ADD \`ThreadStart\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` ADD \`ReplyToId\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` ADD CONSTRAINT \`FK_0d2159ac0fdb17744e27728718f\` FOREIGN KEY (\`ReplyToId\`) REFERENCES \`team_channel_chats\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` ADD CONSTRAINT \`FK_a8841e5ecefa9fc633d0fad16fd\` FOREIGN KEY (\`ReplyToId\`) REFERENCES \`sub_team_channel_chats\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` DROP FOREIGN KEY \`FK_a8841e5ecefa9fc633d0fad16fd\``);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` DROP FOREIGN KEY \`FK_0d2159ac0fdb17744e27728718f\``);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` DROP COLUMN \`ReplyToId\``);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` DROP COLUMN \`ThreadStart\``);
        await queryRunner.query(`ALTER TABLE \`sub_team_channel_chats\` DROP COLUMN \`ThreadId\``);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` DROP COLUMN \`ThreadStart\``);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` DROP COLUMN \`ThreadId\``);
        await queryRunner.query(`ALTER TABLE \`team_channel_chats\` DROP COLUMN \`ReplyToId\``);
    }

}

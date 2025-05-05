import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatHistory1746457105422 implements MigrationInterface {
    name = 'ChatHistory1746457105422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`learning_phase_chat\` (\`message\` varchar(2000) NOT NULL, \`SubTeamId\` varchar(32) NOT NULL, \`response\` json NOT NULL, \`UserId\` varchar(32) NOT NULL, \`Id\` varchar(32) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_chat\` ADD CONSTRAINT \`FK_93d5e18c87c72e74cd53ef8f9ba\` FOREIGN KEY (\`SubTeamId\`) REFERENCES \`sub_teams\`(\`Id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_chat\` ADD CONSTRAINT \`FK_c8c7f5ee86013a71c3bc72d53cf\` FOREIGN KEY (\`UserId\`) REFERENCES \`users\`(\`Id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_chat\` DROP FOREIGN KEY \`FK_c8c7f5ee86013a71c3bc72d53cf\``);
        await queryRunner.query(`ALTER TABLE \`learning_phase_chat\` DROP FOREIGN KEY \`FK_93d5e18c87c72e74cd53ef8f9ba\``);
        await queryRunner.query(`DROP TABLE \`learning_phase_chat\``);
    }

}

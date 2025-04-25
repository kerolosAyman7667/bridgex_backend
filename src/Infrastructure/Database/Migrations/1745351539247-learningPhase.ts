import { MigrationInterface, QueryRunner } from "typeorm";

export class LearningPhase1745351539247 implements MigrationInterface {
    name = 'LearningPhase1745351539247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_progress\` (\`UserId\` varchar(32) NOT NULL, \`VideoId\` varchar(32) NOT NULL, \`IsCompleted\` tinyint NOT NULL DEFAULT 0, \`WatchDuration\` decimal(2) NULL, \`Id\` varchar(32) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`learning_phase_videos\` (\`Name\` varchar(50) NOT NULL, \`SectionId\` varchar(32) NOT NULL, \`File\` varchar(500) NOT NULL, \`Desc\` varchar(325) NULL, \`Duration\` decimal(2) NULL, \`Id\` varchar(32) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`learning_phase_sections\` (\`Name\` varchar(50) NOT NULL, \`SubTeamId\` varchar(32) NOT NULL, \`Number\` int NOT NULL DEFAULT '0', \`Id\` varchar(32) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`learning_phase_resources\` (\`Name\` varchar(50) NOT NULL, \`SectionId\` varchar(32) NOT NULL, \`File\` varchar(500) NOT NULL, \`Id\` varchar(32) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`Id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD CONSTRAINT \`FK_d72c05a8b042b7434f1889eeecb\` FOREIGN KEY (\`UserId\`) REFERENCES \`users\`(\`Id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_progress\` ADD CONSTRAINT \`FK_755c81430f3439fb8a7cf5f7e54\` FOREIGN KEY (\`VideoId\`) REFERENCES \`learning_phase_videos\`(\`Id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` ADD CONSTRAINT \`FK_102f11dfb7c47896f829d2b8539\` FOREIGN KEY (\`SectionId\`) REFERENCES \`sub_teams\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_sections\` ADD CONSTRAINT \`FK_1935eec1ad29f0a9ac4c8eaf69d\` FOREIGN KEY (\`SubTeamId\`) REFERENCES \`sub_teams\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`learning_phase_resources\` ADD CONSTRAINT \`FK_4628caa2ef9fb3e00324f6c4464\` FOREIGN KEY (\`SectionId\`) REFERENCES \`sub_teams\`(\`Id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`learning_phase_resources\` DROP FOREIGN KEY \`FK_4628caa2ef9fb3e00324f6c4464\``);
        await queryRunner.query(`ALTER TABLE \`learning_phase_sections\` DROP FOREIGN KEY \`FK_1935eec1ad29f0a9ac4c8eaf69d\``);
        await queryRunner.query(`ALTER TABLE \`learning_phase_videos\` DROP FOREIGN KEY \`FK_102f11dfb7c47896f829d2b8539\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP FOREIGN KEY \`FK_755c81430f3439fb8a7cf5f7e54\``);
        await queryRunner.query(`ALTER TABLE \`user_progress\` DROP FOREIGN KEY \`FK_d72c05a8b042b7434f1889eeecb\``);
        await queryRunner.query(`DROP TABLE \`learning_phase_resources\``);
        await queryRunner.query(`DROP TABLE \`learning_phase_sections\``);
        await queryRunner.query(`DROP TABLE \`learning_phase_videos\``);
        await queryRunner.query(`DROP TABLE \`user_progress\``);
    }

}

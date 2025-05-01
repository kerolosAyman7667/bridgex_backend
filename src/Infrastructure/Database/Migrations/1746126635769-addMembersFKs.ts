import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMembersFKs1746126635769 implements MigrationInterface {
    name = 'AddMembersFKs1746126635769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` ADD \`TeamId\` varchar(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` ADD \`CommunityId\` varchar(32) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` ADD CONSTRAINT \`FK_85655c30da2e279bc7c005d422d\` FOREIGN KEY (\`CommunityId\`) REFERENCES \`communities\`(\`Id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` ADD CONSTRAINT \`FK_d83d76b14c60c31bb6bb7e9b294\` FOREIGN KEY (\`TeamId\`) REFERENCES \`teams\`(\`Id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` DROP FOREIGN KEY \`FK_d83d76b14c60c31bb6bb7e9b294\``);
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` DROP FOREIGN KEY \`FK_85655c30da2e279bc7c005d422d\``);
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` DROP COLUMN \`CommunityId\``);
        await queryRunner.query(`ALTER TABLE \`sub_team_members\` DROP COLUMN \`TeamId\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class DESC6001746710606806 implements MigrationInterface {
    name = 'DESC6001746710606806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_achievements\` MODIFY COLUMN \`Desc\` varchar(600) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`team_achievements\` DROP COLUMN \`Desc\``);
        await queryRunner.query(`ALTER TABLE \`team_achievements\` ADD \`Desc\` varchar(325) NULL`);
    }

}

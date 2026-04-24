import { Entity, Column, PrimaryColumn } from 'typeorm';

/*
  公司实体
  使用 company_code 作为主键（业务标识）
*/
@Entity()
export class Company {
  @PrimaryColumn()
  company_code!: string;

  @Column()
  company_name!: string;

  @Column()
  level!: number;

  @Column()
  country!: string;

  @Column()
  city!: string;

  @Column()
  founded_year!: number;

  @Column()
  annual_revenue!: number;

  @Column()
  employees!: number;
}
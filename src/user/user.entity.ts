import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

// 用户实体
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // 用户角色：admin > manager > user
  @Column({ default: 'user' })
  role!: 'admin' | 'manager' | 'user';

  @CreateDateColumn({ type: 'datetime', nullable: true })
  create_time!: Date;
}
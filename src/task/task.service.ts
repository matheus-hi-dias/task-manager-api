import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindAllParameters, TaskDTO, TaskStatusEnum } from './task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from 'src/db/entities/task.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  private tasks: TaskDTO[] = [];
  async create(task: TaskDTO) {
    const taskToSave: TaskEntity = {
      title: task.title,
      description: task.description,
      expirationDate: task.expirationDate,
      status: TaskStatusEnum.TO_DO,
    };

    const createdTask = await this.tasksRepository.save(taskToSave);

    return this.mapEntityToDTO(createdTask);
  }

  async findById(id: string): Promise<TaskDTO> {
    const foundTask = await this.tasksRepository.findOne({ where: { id } });

    if (!foundTask) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToDTO(foundTask);
  }

  async findAll(params: FindAllParameters): Promise<TaskDTO[]> {
    const searchParams: FindOptionsWhere<TaskEntity> = {};

    if (params.title) {
      searchParams.title = Like(`%${params.title}%`);
    }
    if (params.status) {
      searchParams.status = Like(`%${params.status}%`);
    }

    const tasksFound = await this.tasksRepository.find({
      where: searchParams,
    });

    return tasksFound.map((task) => this.mapEntityToDTO(task));
  }

  async update(id: string, task: TaskDTO) {
    const foundTask = await this.tasksRepository.findOne({ where: { id } });

    if (!foundTask) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.tasksRepository.update(id, this.mapDTOToEntity(task));
  }

  async remove(id: string) {
    const result = await this.tasksRepository.delete(id);

    if (!result.affected) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private mapEntityToDTO(taskEntity: TaskEntity): TaskDTO {
    return {
      id: taskEntity.id,
      title: taskEntity.title,
      description: taskEntity.description,
      expirationDate: taskEntity.expirationDate,
      status: TaskStatusEnum[taskEntity.status],
    };
  }

  private mapDTOToEntity(taskDTO: TaskDTO): Partial<TaskEntity> {
    return {
      title: taskDTO.title,
      description: taskDTO.description,
      expirationDate: taskDTO.expirationDate,
      status: taskDTO.status.toString(),
    };
  }
}

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  /**
   * Retrieve all events, optionally filtered by status.
   *
   * Args:
   *   status (EventStatus | undefined): Optional status filter.
   *
   * Returns:
   *   Promise<Event[]>: Array of matching events ordered by date ascending.
   */
  async findAll(status?: EventStatus): Promise<Event[]> {
    const options: FindManyOptions<Event> = {
      order: { date: 'ASC' },
    };

    if (status) {
      options.where = { status };
    }

    return this.eventsRepository.find(options);
  }

  /**
   * Retrieve a single event by its UUID.
   *
   * Args:
   *   id (string): The event UUID.
   *
   * Returns:
   *   Promise<Event>: The found event.
   *
   * Throws:
   *   NotFoundException: If no event with the given id exists.
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }
    return event;
  }

  /**
   * Create a new event.
   *
   * Args:
   *   dto (CreateEventDto): Validated creation payload.
   *
   * Returns:
   *   Promise<Event>: The persisted event.
   */
  async create(dto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create({
      ...dto,
      date: new Date(dto.date),
    });
    return this.eventsRepository.save(event);
  }

  /**
   * Update an existing event by id.
   *
   * Args:
   *   id (string): The event UUID.
   *   dto (UpdateEventDto): Partial update payload.
   *
   * Returns:
   *   Promise<Event>: The updated event.
   */
  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    // Reason: cast to access optional fields after PartialType spread safely
    const payload = dto as Record<string, unknown>;
    const updated = this.eventsRepository.merge(event, {
      ...dto,
      ...(payload['date'] ? { date: new Date(payload['date'] as string) } : {}),
    });
    return this.eventsRepository.save(updated);
  }

  /**
   * Delete an event by id.
   *
   * Args:
   *   id (string): The event UUID.
   *
   * Returns:
   *   Promise<void>
   */
  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}

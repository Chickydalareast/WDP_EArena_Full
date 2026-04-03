import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExamMatricesService } from './exam-matrices.service';
import {
  CreateExamMatrixDto,
  UpdateExamMatrixDto,
} from './dto/exam-matrix.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpdateMatrixPayload } from './interfaces/exam-matrix.interface';

@Controller('exam-matrices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamMatricesController {
  constructor(private readonly matricesService: ExamMatricesService) {}

  @Post()
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async createMatrix(
    @Body() dto: CreateExamMatrixDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload = {
      title: dto.title,
      description: dto.description,
      subjectId: dto.subjectId,
      sections: dto.sections,
    };
    return this.matricesService.createMatrixTemplate(userId, payload);
  }

  @Get()
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async getMatrices(
    @Query() query: PaginationDto & { subjectId?: string; search?: string },
    @CurrentUser('userId') userId: string,
  ) {
    return this.matricesService.getMatrices(userId, {
      page: query.page || 1,
      limit: query.limit || 10,
      subjectId: query.subjectId,
      search: query.search,
    });
  }

  @Get(':id')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async getMatrixDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.matricesService.getMatrixDetail(id, userId);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async deleteMatrix(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.matricesService.deleteMatrix(id, userId);
  }

  @Put(':id')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  async updateMatrix(
    @Param('id') id: string,
    @Body() dto: UpdateExamMatrixDto,
    @CurrentUser('userId') userId: string,
  ) {
    const payload: UpdateMatrixPayload = {
      title: dto.title,
      description: dto.description,
      subjectId: dto.subjectId,
      sections: dto.sections,
    };
    return this.matricesService.updateMatrix(id, userId, payload);
  }

  @Post(':id/clone')
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async cloneMatrix(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.matricesService.cloneMatrix(id, userId);
  }
}

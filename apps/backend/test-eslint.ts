import { HttpException, HttpStatus } from '@nestjs/common';
const error = new HttpException('test', HttpStatus.NOT_FOUND);

// Option 1
if (error.getStatus() === HttpStatus.NOT_FOUND) {}
// Option 2
if (error.getStatus() === Number(HttpStatus.NOT_FOUND)) {}
// Option 3
if (error.getStatus() as unknown === HttpStatus.NOT_FOUND) {}
// Option 4
if (error.getStatus() === (HttpStatus.NOT_FOUND as unknown as number)) {}

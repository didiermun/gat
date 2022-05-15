import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpErrorFilter, host: ArgumentsHost) {
    // const ctx = host.switchToHttp()
    // const response = ctx.getResponse<Response>()
    // const status = 200
    // response
    //   .status(status)
    //   .json(HttpErrorFilter.getApolloServerFormatError(exception));
  }
}

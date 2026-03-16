import {CustomApiError} from './customApiError';
import {UnauthenticatedError} from './UnauthenticatedError';
import {BadRequestError} from './badRequest';
import {UnauthorizedError} from './Unauthorized'
import {SystemError} from './systemError'

const errors = {
    CustomApiError,
    UnauthenticatedError,
    BadRequestError,
    UnauthorizedError,
    SystemError
  };

export default errors;
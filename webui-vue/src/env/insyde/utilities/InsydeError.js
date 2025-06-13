import { cloneClass } from '@/env/insyde/utilities/InsydeTools';

export const CANCEL = '__CANCEL_PATTERN__';
export const IGNORE = '__IGNIRE_PATTERN__';

class _InsydeError extends Error {
  static CANCEL = CANCEL;
  static IGNORE = IGNORE;
  constructor(e1, e2) {
    if (e2?.message == 'canceled' || e2?.message == _InsydeError.CANCEL) {
      super(_InsydeError.CANCEL);
      this.omessage = e1; // Original message.
      this.parent = e2; // Parent error.
    } else {
      super(e1);
    }
  }
  isCanceled() {
    return this.message == _InsydeError.CANCEL;
  }
}

// PATCH: For the use without the keyword new.
// But still cannot use static members.
let InsydeError = (...args) => {
  return new _InsydeError(...args);
};

// PATCH: Pack it for static call
cloneClass(InsydeError, _InsydeError);

export default InsydeError;

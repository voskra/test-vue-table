import format from 'date-fns/format';

export function throttle<T>(
  callee: (...args: Array<T>) => void,
  timeout: number
) {
  let timer: number | undefined;

  return function perform(...args: Array<T>) {
    if (timer) return;

    timer = setTimeout(() => {
      callee(...args);

      clearTimeout(timer);
      timer = void 0;
    }, timeout);
  };
}

export function timeFormatter(timestamp: string): string {
  return format(new Date(timestamp), 'Pp');
}

export function proposerFormatter(
  proposer: null | {
    alias: 'string';
    address: 'string';
  }
): string {
  if (!proposer) {
    return '';
  }

  if (proposer.alias) {
    return proposer.alias;
  }

  return proposer.address;
}

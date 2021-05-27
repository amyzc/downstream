import Channel from './channel';

/**
 * TODO documentation
 */
export interface PollOptions {
  delay?: number;
  interval?: number;
}

/**
 * TODO documentation
 */
abstract class PollChannel extends Channel {
  /**
   * Fetch items.
   */
  protected abstract fetch(): Promise<void>;

  protected delay: number;

  protected interval: number;

  protected timeout?:ReturnType<typeof setTimeout>;

  private static DEFAULT_INTERVAL: number = 10000;

  constructor(options: PollOptions = {}) {
    super();

    this.delay = options.delay || 0;
    this.interval = options.interval || PollChannel.DEFAULT_INTERVAL;
  }

  async start(): Promise<void> {
    // return if the PollChannel already started
    if (this.started) return;

    await super.start();

    // run the first poll
    if (this.delay) {
      setTimeout(this.poll.bind(this), this.delay);
    } else {
      this.poll();
    }
  }

  async stop(): Promise<void> {
    if (this.timeout) clearTimeout(this.timeout);
    delete this.timeout;
    await super.stop();
  }

  /**
   * Poll
   */
  protected async poll(): Promise<void> {
    // return if the PollChannel is not started
    if (!this.started) return;

    // try to call `fetch`
    try {
      await this.fetch();
    } catch (err) {
      this.emit('error', err);
    }

    // schedule the next poll
    this.timeout = setTimeout(
      this.poll.bind(this),
      this.interval,
    );
  }
}

export default PollChannel;

import { hash } from 'bcrypt';

export class GenerateHashService {
  public async execute(text: string): Promise<string> {
    const textHash = await hash(text, 8);

    return textHash;
  }
}

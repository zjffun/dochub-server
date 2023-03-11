export async function gitHashObject(text: string) {
  const { execa } = await import('execa');

  const { stdout } = await execa('git', ['hash-object', '-w', '--stdin'], {
    input: text,
  });

  return stdout;
}

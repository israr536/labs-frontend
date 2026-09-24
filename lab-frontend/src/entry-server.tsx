import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

export function render(pathname: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
      mutations: { retry: 0 },
    },
  });

  return new Promise<string>((resolve, reject) => {
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    let firstError: unknown = null;

    output.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    output.on('end', () => {
      if (firstError) {
        reject(firstError);
        return;
      }
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    const { pipe } = renderToPipeableStream(
      <MemoryRouter initialEntries={[pathname]}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
      {
        onAllReady: () => pipe(output),
        onShellError: reject,
        onError: (error) => {
          firstError ??= error;
          console.error(error);
        },
      },
    );
  });
}

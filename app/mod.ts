import pogo from "https://deno.land/x/pogo@v0.6.0/main.ts";

type ApplicationOptions = Partial<{

}>;

export default (port = 4000, options: ApplicationOptions = {}) => {
  const server = pogo.server({ port });
};

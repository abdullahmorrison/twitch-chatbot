import { trpcClient } from "../src/trpcClient"

async function main() {
    const  response = await trpcClient.linkDelete.mutate("https://streamable.com/cjkg2l")
    if(response) console.log("Link deleted")
}
main()

//run script: npx ts-node-dev apps/client/scripts/manual-remove-link.ts
//
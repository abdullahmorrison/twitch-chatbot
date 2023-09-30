import { trpcClient } from '../src/trpcClient'

async function main(){
    const fetchStreamables = await fetch('https://i.nuuls.com/0k2RQ.txt')
    const streamablesData = await fetchStreamables.text()

    //extract the streamable links, skip first 4 lines
    const streambles = streamablesData.split('\n').slice(4).map((line) => {
        return line.split(',')[0]
    })

    for(let i=0;i<streambles.length;i++){
        const response= await trpcClient.linkCreate.mutate(streambles[i]) as {url: string}
        if(response) console.log(response.url+" "+(i+1))
    }
}
main()
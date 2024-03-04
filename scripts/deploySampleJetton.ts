import { beginCell, toNano } from '@ton/core';
import { SampleJetton } from '../wrappers/SampleJetton';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const content = beginCell()
        .storeStringRefTail('Sample Jetton Token')
        .storeCoins(1000000n) // Total Supply
        .storeAddress(provider.sender().address!!)
        .storeRef(beginCell().endCell())
        .endCell();

    const sampleJetton = provider.open(await SampleJetton.fromInit(provider.sender().address!!, content, 1000000n));

    await sampleJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        },
    );

    await provider.waitForDeploy(sampleJetton.address);

    // run methods on `sampleJetton`
}

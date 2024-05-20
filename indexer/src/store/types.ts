export interface IStorageService {

    setText(node: string, key: string, record: string)
    setAddr(node: string, coinType: string, address: string)
    setContentHash(node: string, contentHash: string)
    getSubnameNode(node: string)

    getSubnameNode(node: string):  Promise<ISubnameNode>
    createSubnameNode(node: ISubnameNode)
}

export interface ISubnameNode {
    label: string
    subnameNode: string
    parentNode: string
    owner: string
    texts?: Record<string, string>
    contentHash?: string
    expiry: number
    addresses?: Record<string, string>
}
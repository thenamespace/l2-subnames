import { useEffect,useState } from "react"
import { ScreenContainer } from "../components"
import { Listing } from "../api/types"
import { getListings } from "../api"

export const NameSelectorPage = () => {

    const [listedNames,setListedNames] = useState<{
        isFetching: boolean
        items: Listing[]
    }>({
        isFetching: true,
        items: []
    })

    useEffect(() => {
        getListings("").then(res => {
            setListedNames({
                isFetching: false,
                items: res
            })
        })
    },[])

    if (listedNames.isFetching) {
        return <ScreenContainer isLoading={true}/>
    }

    return <ScreenContainer>

    </ScreenContainer>
}
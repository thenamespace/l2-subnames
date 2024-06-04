import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MintPage } from "./pages/MintPage"
import { NameSelectorPage } from "./pages/NameSelectorPage"
import { MintPageSponsored } from "./pages/MintPageSponsored"

export const AppRouter = () => {
    return <BrowserRouter>
        <Routes>
            <Route path="/mint/:parentName" element={<MintPage />}></Route>
            <Route path="/based-summer/:parentName" element={<MintPageSponsored/>}></Route>
            <Route index element={<NameSelectorPage/>}></Route>
        </Routes>
    </BrowserRouter>
}
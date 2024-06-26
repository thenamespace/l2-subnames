import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MintPage } from "./pages/MintPage"
import { NameSelectorPage } from "./pages/NameSelectorPage"
import { ListingPage } from "./pages/ListingPage"

export const AppRouter = () => {
    return <BrowserRouter>
        <Routes>
            <Route path="/mint/:parentName" element={<MintPage />}></Route>
            <Route index element={<NameSelectorPage />}></Route>
            <Route path="/list" element={<ListingPage />}></Route>
        </Routes>
    </BrowserRouter>
}
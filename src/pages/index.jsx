import Layout from "./Layout.jsx";

import Home from "./Home";

import PropertyDetail from "./PropertyDetail";

import Search from "./Search";

import Chat from "./Chat";

import Profile from "./Profile";

import CreateListing from "./CreateListing";

import PersonalInfo from "./PersonalInfo";

import Verification from "./Verification";

import Notifications from "./Notifications";

import Contracts from "./Contracts";

import Help from "./Help";

import CategorySearch from "./CategorySearch";

import EditListing from "./EditListing";

import HelpDetail from "./HelpDetail";

import EmailVerification from "./EmailVerification";

import PhoneVerification from "./PhoneVerification";

import IDVerification from "./IDVerification";

import PropertyVerification from "./PropertyVerification";

import AdminReports from "./AdminReports";

import RentalLegalInfo from "./RentalLegalInfo";

import SaleLegalInfo from "./SaleLegalInfo";

import TransactionHistory from "./TransactionHistory";

import WriteReview from "./WriteReview";

import AdminUsers from "./AdminUsers";

import Favorites from "./Favorites";

import StampDutyCalculator from "./StampDutyCalculator";

import Welcome from "./Welcome";

import Premium from "./Premium";

import PropertyViews from "./PropertyViews";

import BlockedUsers from "./BlockedUsers";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    PropertyDetail: PropertyDetail,
    
    Search: Search,
    
    Chat: Chat,
    
    Profile: Profile,
    
    CreateListing: CreateListing,
    
    PersonalInfo: PersonalInfo,
    
    Verification: Verification,
    
    Notifications: Notifications,
    
    Contracts: Contracts,
    
    Help: Help,
    
    CategorySearch: CategorySearch,
    
    EditListing: EditListing,
    
    HelpDetail: HelpDetail,
    
    EmailVerification: EmailVerification,
    
    PhoneVerification: PhoneVerification,
    
    IDVerification: IDVerification,
    
    PropertyVerification: PropertyVerification,
    
    AdminReports: AdminReports,
    
    RentalLegalInfo: RentalLegalInfo,
    
    SaleLegalInfo: SaleLegalInfo,
    
    TransactionHistory: TransactionHistory,
    
    WriteReview: WriteReview,
    
    AdminUsers: AdminUsers,
    
    Favorites: Favorites,
    
    StampDutyCalculator: StampDutyCalculator,
    
    Welcome: Welcome,
    
    Premium: Premium,
    
    PropertyViews: PropertyViews,
    
    BlockedUsers: BlockedUsers,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/PropertyDetail" element={<PropertyDetail />} />
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/CreateListing" element={<CreateListing />} />
                
                <Route path="/PersonalInfo" element={<PersonalInfo />} />
                
                <Route path="/Verification" element={<Verification />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/Contracts" element={<Contracts />} />
                
                <Route path="/Help" element={<Help />} />
                
                <Route path="/CategorySearch" element={<CategorySearch />} />
                
                <Route path="/EditListing" element={<EditListing />} />
                
                <Route path="/HelpDetail" element={<HelpDetail />} />
                
                <Route path="/EmailVerification" element={<EmailVerification />} />
                
                <Route path="/PhoneVerification" element={<PhoneVerification />} />
                
                <Route path="/IDVerification" element={<IDVerification />} />
                
                <Route path="/PropertyVerification" element={<PropertyVerification />} />
                
                <Route path="/AdminReports" element={<AdminReports />} />
                
                <Route path="/RentalLegalInfo" element={<RentalLegalInfo />} />
                
                <Route path="/SaleLegalInfo" element={<SaleLegalInfo />} />
                
                <Route path="/TransactionHistory" element={<TransactionHistory />} />
                
                <Route path="/WriteReview" element={<WriteReview />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/Favorites" element={<Favorites />} />
                
                <Route path="/StampDutyCalculator" element={<StampDutyCalculator />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Premium" element={<Premium />} />
                
                <Route path="/PropertyViews" element={<PropertyViews />} />
                
                <Route path="/BlockedUsers" element={<BlockedUsers />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
// src/components/NewLayout.js

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaSignOutAlt,
    FaBars,
    FaChartLine,
    FaTachometerAlt,
    FaBoxOpen,
    FaBoxes,
    FaTags,
    FaLayerGroup,
    FaWarehouse,
    FaArrowDown,
    FaTruckMoving,
    FaExchangeAlt,
    FaRandom,
    FaUser,
    FaUsers,
    FaBalanceScale,
} from 'react-icons/fa';
import api from '../utils/axios';

const NewLayout = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        return localStorage.getItem('sidebarExpanded') === 'true';
    });
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me'); // backend should return { username, role }
                setRole(res.data.role);
            } catch (err) {
                console.error('Failed to fetch user info:', err);
                navigate('/login'); // not logged in
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.get("/auth/logout"); // call backend logout (clears cookie)
            window.location.href = "/login"; // full reload so PrivateRoute re-checks cookie
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const toggleSidebar = () => {
        const newState = !sidebarExpanded;
        setSidebarExpanded(newState);
        localStorage.setItem('sidebarExpanded', newState);
    };

    // const menuItems = [
    //     { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt />, allowedRoles: ['admin', 'purchasing', 'sales'] },
    //     { name: 'User', path: '/users', icon: <FaUser />, allowedRoles: ['admin'] },
    //     { name: 'Product', path: '/products', icon: <FaBoxOpen />, allowedRoles: ['admin', 'purchasing', 'sales'] },
    //     { name: 'Category', path: '/categories', icon: <FaTags />, allowedRoles: ['admin', 'purchasing', 'sales'] },
    //     { name: 'Warehouse', path: '/warehouses', icon: <FaWarehouse />, allowedRoles: ['admin', 'purchasing', 'sales'] },
    //     { name: 'Inbound', path: '/inbound', icon: <FaArrowDown />, allowedRoles: ['admin', 'purchasing'] },
    //     { name: 'Outbound', path: '/outbound', icon: <FaTruckMoving />, allowedRoles: ['admin', 'sales'] },
    //     { name: 'Stock Movement', path: '/stock-movement', icon: <FaExchangeAlt />, allowedRoles: ['admin', 'purchasing', 'sales'] },
    //     { name: 'Report', path: '/reports/outbound', icon: <FaArrowUp />, allowedRoles: ['admin'] },
    // ];

    const menuSections = [
        {
            section: null, // General (no label)
            items: [
                { name: "Dashboard", path: "/dashboard", icon: <FaChartLine />, allowedRoles: ["admin", "purchasing", "sales"] },
                { name: "User", path: "/users", icon: <FaUser />, allowedRoles: ["admin"] },
                { name: "Product", path: "/products", icon: <FaBoxOpen />, allowedRoles: ["admin", "purchasing", "sales"] },
                { name: "Category", path: "/categories", icon: <FaTags />, allowedRoles: ["admin", "purchasing", "sales"] },
                { name: "Warehouse", path: "/warehouses", icon: <FaWarehouse />, allowedRoles: ["admin", "purchasing", "sales"] },
                { name: "Inbound", path: "/inbound", icon: <FaArrowDown />, allowedRoles: ["admin", "purchasing"] },
                { name: "Outbound", path: "/outbound", icon: <FaTruckMoving />, allowedRoles: ["admin", "sales"] },
                { name: "Stock Movement", path: "/stock-movement", icon: <FaExchangeAlt />, allowedRoles: ["admin", "purchasing", "sales"] },
                { name: "Reconciliation", path: "/reconciliation", icon: <FaBalanceScale />, allowedRoles: ["admin"]},
            ],
        },
        {
            section: "Reports",
            items: [
                { name: "Inbound", path: "/reports/inbound", icon: <FaArrowDown />, allowedRoles: ["admin"] },
                { name: "Outbound", path: "/reports/outbound", icon: <FaTruckMoving />, allowedRoles: ["admin"] },
                { name: "Reconciliation", path: "/reports/reconciliation", icon: <FaBalanceScale />, allowedRoles: ["admin"] },
            ],
        },
    ];


    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    const collapsedWidth = 70;     // collapsed sidebar width
    const sidebarPadding = 10;     // padding you applied in style

    const iconCellWidth = collapsedWidth - sidebarPadding * 2;

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <div
                className="scroll-hidden d-flex flex-column bg-white shadow-sm border-end"
                style={{
                    width: sidebarExpanded ? '220px' : `${collapsedWidth}px`,
                    transition: 'width 0.3s ease-in-out',
                    padding: `${sidebarPadding}px`,
                    height: "100vh",         // 👈 full viewport height
                    overflowY: "auto",       // 👈 enable vertical scroll if content is too tall
                }}
            >

                {/* Menu Items */}
                <ul className="nav nav-pills flex-column flex-grow-1 gap-2 pb-5">
                    {/* Hamburger Menu */}
                    <li className="nav-item">
                        <button
                            onClick={toggleSidebar}
                            className="nav-link rounded d-flex align-items-center w-100"
                            style={{
                                height: '45px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                padding: 0,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.075)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {/* ICON CELL */}
                            <div
                                style={{
                                    width: `${iconCellWidth}px`,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FaBars />
                            </div>

                            {/* TEXT CELL */}
                            <div
                                style={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    transition:
                                        'max-width 0.2s ease-in-out, opacity 0.2s ease-in-out',
                                    maxWidth: sidebarExpanded ? '200px' : '0',
                                    opacity: sidebarExpanded ? 1 : 0,
                                }}
                            >
                                {/* Menu */}
                            </div>
                        </button>
                    </li>

                    {/* Actual Menu Items */}
                    {menuSections.map(({ section, items }) => {
                        const filtered = items.filter((item) => item.allowedRoles.includes(role));
                        if (filtered.length === 0) return null;

                        return (
                            <React.Fragment key={section || "general"}>
                                {/* Only render border + label if section has a name */}
                                {section && (
                                    <>
                                        <div className="border-top my-3"></div>
                                        {sidebarExpanded && (
                                            <div className="px-2 text-muted small mb-2 text-uppercase">
                                                {section}
                                            </div>
                                        )}
                                    </>
                                )}

                                {filtered.map((item) => (
                                    <li className="nav-item" key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`nav-link rounded d-flex align-items-center w-100 ${location.pathname === item.path
                                                ? "active bg-primary text-white"
                                                : "text-dark"
                                                }`}
                                            style={{
                                                height: "45px",
                                                padding: 0,
                                                backgroundColor:
                                                    location.pathname === item.path ? "" : "transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!e.currentTarget.classList.contains("active")) {
                                                    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.075)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!e.currentTarget.classList.contains("active")) {
                                                    e.currentTarget.style.backgroundColor = "transparent";
                                                }
                                            }}
                                        >
                                            {/* ICON CELL */}
                                            <div
                                                style={{
                                                    width: `${iconCellWidth}px`,
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.icon}
                                            </div>

                                            {/* TEXT CELL */}
                                            <div
                                                style={{
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    transition:
                                                        "max-width 0.2s ease-in-out, opacity 0.2s ease-in-out",
                                                    maxWidth: sidebarExpanded ? "200px" : "0",
                                                    opacity: sidebarExpanded ? 1 : 0,
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </React.Fragment>
                        );
                    })}

                </ul>

                {/* Logout Button */}
                <div className="pt-2 mt-auto">
                    <button
                        className="btn btn-outline-danger w-100 d-flex align-items-center"
                        style={{ height: '45px', padding: 0 }}
                        onClick={handleLogout}
                    >
                        {/* ICON CELL */}
                        <div
                            style={{
                                width: `${iconCellWidth}px`, // ✅ same width logic as menu items
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <FaSignOutAlt />
                        </div>

                        {/* TEXT CELL */}
                        <div
                            style={{
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                transition:
                                    'max-width 0.2s ease-in-out, opacity 0.2s ease-in-out',
                                maxWidth: sidebarExpanded ? '200px' : '0',
                                opacity: sidebarExpanded ? 1 : 0,
                            }}
                        >
                            Logout
                        </div>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main
                className="flex-grow-1 p-4 bg-light"
                style={{
                    height: "100vh",
                    overflowY: "auto", // same trick
                }}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default NewLayout;


{/* Old logout method (just clear cookie on client side) */ }
// const handleLogout = () => {
//     document.cookie = "token=; Max-Age=0";
//     navigate("/login");
// };

{/* Old return 1 */ }
// return (
//     <div className="d-flex min-vh-100">
//         {/* Sidebar */}
//         <div
//             className="d-flex flex-column bg-white border-end shadow-sm p-2"
//             style={{
//                 width: sidebarExpanded ? '220px' : '70px',
//                 transition: 'width 0.3s ease-in-out',
//             }}
//         >
//             {/* Toggle Button */}
//             <div className="d-flex justify-content-start">
//                 <button
//                     className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
//                     style={{ width: '40px', height: '40px' }}
//                     onClick={toggleSidebar}
//                 >
//                     <FaBars />
//                 </button>
//             </div>

//             {/* Menu Items */}
//             <ul className="nav nav-pills flex-column flex-grow-1">
//                 {menuItems
//                     .filter(item => item.allowedRoles.includes(role))
//                     .map((item) => (

//                         <li className="nav-item my-1" key={item.path}>

//                             <Link
//                                 to={item.path}
//                                 className={`nav-link rounded d-flex align-items-center gap-3 ${location.pathname === item.path
//                                     ? 'active bg-primary text-white'
//                                     : 'text-dark'
//                                     }`}
//                                 style={{
//                                     justifyContent: sidebarExpanded ? 'flex-start' : 'center',
//                                     height: '40px',
//                                     transition: 'all 0.2s ease-in-out',
//                                 }}
//                             >
//                                 {/* {item.icon} */}
//                                 <span style={{ flexShrink: 0 }}>
//                                     {item.icon}
//                                 </span>
//                                 {sidebarExpanded && <span>{item.name}</span>}
//                             </Link>

//                         </li>
//                     ))}
//             </ul>

//             {/* Logout Button */}
//             <div className="p-1 pt-3 border-top">
//                 <button
//                     className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
//                     style={{ height: '35px' }}
//                     onClick={handleLogout}
//                 >
//                     <FaSignOutAlt />
//                     {sidebarExpanded && 'Logout'}
//                 </button>
//             </div>
//         </div>

//         {/* Main Content */}
//         <main className="flex-grow-1 p-4 bg-light">
//             <Outlet />
//         </main>
//     </div>
// );

{/* Old return 2 */ }
// return (
//     <div className="d-flex min-vh-100">
//         {/* Sidebar */}
//         <div
//             className="d-flex flex-column bg-white shadow-sm p-2 border-end"
//             style={{
//                 width: sidebarExpanded ? '230px' : '70px',
//                 transition: 'width 0.3s ease-in-out',
//             }}
//         >
//             {/* Menu Items */}
//             <ul className="nav nav-pills flex-column flex-grow-1">
//                 {/* Hamburger Menu as first item */}
//                 <li className="nav-item">
//                     <button
//                         onClick={toggleSidebar}
//                         className="nav-link rounded d-flex align-items-center px-2 text-dark w-100"
//                         style={{
//                             height: '45px',
//                             transition: 'all 0.2s ease-in-out',
//                             overflow: 'hidden',
//                             backgroundColor: 'transparent',
//                             border: 'none',
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor = '#f8f9fa';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor = 'transparent';
//                         }}
//                     >
//                         {/* ICON CELL */}
//                         <div
//                             style={{
//                                 width: '40px',
//                                 minWidth: '40px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 flexShrink: 0,
//                             }}
//                         >
//                             <FaBars />
//                         </div>

//                         {/* TEXT CELL */}
//                         <div
//                             style={{
//                                 overflow: 'hidden',
//                                 whiteSpace: 'nowrap',
//                                 transition:
//                                     'max-width 0.2s ease-in-out, opacity 0.2s ease-in-out',
//                                 maxWidth: sidebarExpanded ? '200px' : '0',
//                                 opacity: sidebarExpanded ? 1 : 0,
//                             }}
//                         >
//                             {/* Menu */}
//                         </div>
//                     </button>
//                 </li>

//                 {/* Actual Menu Items */}
//                 {menuItems
//                     .filter((item) => item.allowedRoles.includes(role))
//                     .map((item) => (
//                         <li className="nav-item my-1" key={item.path}>
//                             <Link
//                                 to={item.path}
//                                 className={`nav-link rounded d-flex align-items-center px-2 ${location.pathname === item.path
//                                     ? 'active bg-primary text-white'
//                                     : 'text-dark'
//                                     }`}
//                                 style={{
//                                     height: '45px',
//                                     transition: 'all 0.2s ease-in-out',
//                                     overflow: 'hidden',
//                                     backgroundColor:
//                                         location.pathname === item.path
//                                             ? ''
//                                             : 'transparent',
//                                 }}
//                                 onMouseEnter={(e) => {
//                                     if (
//                                         !e.currentTarget.classList.contains(
//                                             'active'
//                                         )
//                                     ) {
//                                         e.currentTarget.style.backgroundColor =
//                                             '#f8f9fa';
//                                     }
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     if (
//                                         !e.currentTarget.classList.contains(
//                                             'active'
//                                         )
//                                     ) {
//                                         e.currentTarget.style.backgroundColor =
//                                             'transparent';
//                                     }
//                                 }}
//                             >
//                                 {/* ICON CELL */}
//                                 <div
//                                     style={{
//                                         width: '40px',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         flexShrink: 0,
//                                     }}
//                                 >
//                                     {item.icon}
//                                 </div>

//                                 {/* TEXT CELL */}
//                                 <div
//                                     style={{
//                                         overflow: 'hidden',
//                                         whiteSpace: 'nowrap',
//                                         transition:
//                                             'max-width 0.2s ease-in-out, opacity 0.2s ease-in-out',
//                                         maxWidth: sidebarExpanded
//                                             ? '200px'
//                                             : '0',
//                                         opacity: sidebarExpanded ? 1 : 0,
//                                     }}
//                                 >
//                                     {item.name}
//                                 </div>
//                             </Link>
//                         </li>
//                     ))}
//             </ul>

//             {/* Logout Button */}
//             <div className="p-3 border-top">
//                 <button
//                     className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
//                     style={{ height: '35px' }}
//                     onClick={handleLogout}
//                 >
//                     <FaSignOutAlt />
//                     {sidebarExpanded && 'Logout'}
//                 </button>
//             </div>
//         </div>

//         {/* Main Content */}
//         <main className="flex-grow-1 p-4 bg-light">
//             <Outlet />
//         </main>
//     </div>
// );

{/* Old return 3, hardcoded menu link & icon width */ }
// return (

//     // Hardcoded 49.2 px width according to parent width and padding

//     <div className="d-flex min-vh-100">
//         {/* Sidebar */}
//         <div
//             className="d-flex flex-column bg-white shadow-sm border-end"
//             style={{
//                 width: sidebarExpanded ? '230px' : '70px',
//                 transition: 'width 0.3s ease-in-out',
//                 padding: '10px', // ✅ uniform spacing around all items
//             }}
//         >
//             {/* Menu Items */}
//             <ul className="nav nav-pills flex-column flex-grow-1 gap-2">
//                 {/* Hamburger Menu */}
//                 <li className="nav-item">
//                     <button
//                         onClick={toggleSidebar}
//                         className="nav-link rounded d-flex align-items-center w-100"
//                         style={{
//                             height: '45px',
//                             backgroundColor: 'transparent',
//                             border: 'none',
//                             padding: 0, // ✅ remove padding inside
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.backgroundColor = '#f8f9fa';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.backgroundColor = 'transparent';
//                         }}
//                     >
//                         {/* ICON CELL */}
//                         <div
//                             style={{
//                                 width: '49.2px',
//                                 height: '100%',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                             }}
//                         >
//                             <FaBars />
//                         </div>

//                         {/* TEXT CELL */}
//                         <div
//                             style={{
//                                 overflow: 'hidden',
//                                 whiteSpace: 'nowrap',
//                                 transition:
//                                     'max-width 0.2s ease-in-out, opacity 0.2s ease-in-out',
//                                 maxWidth: sidebarExpanded ? '200px' : '0',
//                                 opacity: sidebarExpanded ? 1 : 0,
//                             }}
//                         >
//                             {/* Menu */}
//                         </div>
//                     </button>
//                 </li>

//                 {/* Actual Menu Items */}
//                 {menuItems
//                     .filter((item) => item.allowedRoles.includes(role))
//                     .map((item) => (
//                         <li className="nav-item" key={item.path}>
//                             <Link
//                                 to={item.path}
//                                 className={`nav-link rounded d-flex align-items-center w-100 ${location.pathname === item.path
//                                     ? 'active bg-primary text-white'
//                                     : 'text-dark'
//                                     }`}
//                                 style={{
//                                     height: '45px',
//                                     padding: 0, // ✅ no extra spacing inside
//                                     backgroundColor:
//                                         location.pathname === item.path ? '' : 'transparent',
//                                 }}
//                                 onMouseEnter={(e) => {
//                                     if (!e.currentTarget.classList.contains('active')) {
//                                         e.currentTarget.style.backgroundColor = '#f8f9fa';
//                                     }
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     if (!e.currentTarget.classList.contains('active')) {
//                                         e.currentTarget.style.backgroundColor = 'transparent';
//                                     }
//                                 }}
//                             >
//                                 {/* ICON CELL */}
//                                 <div
//                                     style={{
//                                         width: '49.2px',
//                                         height: '100%',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         flexShrink: 0,
//                                     }}
//                                 >
//                                     {item.icon}
//                                 </div>

//                                 {/* TEXT CELL */}
//                                 <div
//                                     style={{
//                                         overflow: 'hidden',
//                                         whiteSpace: 'nowrap',
//                                         transition:
//                                             'max-width 0.2s ease-in-out, opacity 0.2s ease-in-out',
//                                         maxWidth: sidebarExpanded ? '200px' : '0',
//                                         opacity: sidebarExpanded ? 1 : 0,
//                                     }}
//                                 >
//                                     {item.name}
//                                 </div>
//                             </Link>
//                         </li>
//                     ))}
//             </ul>

//             {/* Logout Button */}
//             <div className="p-1 pt-3 border-top">
//                 <button
//                     className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
//                     style={{ height: '35px' }}
//                     onClick={handleLogout}
//                 >
//                     <FaSignOutAlt />
//                     {sidebarExpanded && 'Logout'}
//                 </button>
//             </div>
//         </div>

//         {/* Main Content */}
//         <main className="flex-grow-1 p-4 bg-light">
//             <Outlet />
//         </main>
//     </div>
// );



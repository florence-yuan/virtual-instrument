export default function NavBar() {
    return (
        <nav className="nav-bar">
            <div
                className="nav__link nav__link--github"
            >
                <a
                    href="https://github.com/florence-yuan/virtual-instrument"
                    className="nav__icon nav__icon--github"
                >
                    GitHub
                </a>
                <div className="nav__label">
                    Code at GitHub
                </div>
            </div>
        </nav>
    )
}
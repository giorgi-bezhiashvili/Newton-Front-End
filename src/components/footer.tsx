import Link from "next/link";

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footerContainer">
                <div className="footerBrand">
                    <p className="footerCopyright">© {year} Newton. ყველა უფლება დაცულია.</p>
                    <p className="footerTagline">
                        ინოვაციური პლატფორმა ფიზიკის შესასწავლად. ისწავლე, ივარჯიშე და აღმოაჩინე სამყარო ჩვენთან ერთად.
                    </p>
                </div>

                <nav className="footerLinks" aria-label="Footer navigation">
                    <Link href="/about" className="footerLink">შესახებ</Link>
                    <Link href="/terms" className="footerLink">წესები და პირობები</Link>
                    <Link href="/privacy" className="footerLink">კონფიდენციალურობა</Link>

                    <a
                        href="https://linktr.ee/giorgibezhiashvili"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footerLink footerLinkDev"
                    >
                        Developer: Giorgi Bezhiashvili
                    </a>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;
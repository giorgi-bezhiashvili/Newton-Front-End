export default function PageLoader() {
    return (
        <div className="pageLoader">
            <div className="pageLoaderSpinner" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <p className="pageLoaderText">იტვირთება...</p>
        </div>
    )
}
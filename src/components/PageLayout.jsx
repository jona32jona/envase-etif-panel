import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import PageHeader from './PageHeader'
import PageFooter from './PageFooter'
import { useLoading } from '../context/LoadingContext'

const PageLayout = ({
  title,
  icon,
  children,
  showFooter = true,
  footerButtons = {},
}) => {
  const { show, hide } = useLoading()
  const footerRef = useRef(null)
  const [footerHeight, setFooterHeight] = useState(0)

  useLayoutEffect(() => {
    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    show()
    setTimeout(() => {
      if (mounted) hide()
    }, 1000)
    return () => { mounted = false }
  }, [])

  return (
    <div className="flex flex-col h-full text-text">
      <div className="p-4 flex-none">
        <PageHeader title={title} icon={icon} />
      </div>

      <div
        className="flex-1 overflow-y-auto px-4"
        style={{ paddingBottom: showFooter ? `${footerHeight}px` : undefined }}
      >
        {children}
      </div>

      {showFooter && (
        <div ref={footerRef} className="flex-none">
          <PageFooter {...footerButtons} />
        </div>
      )}
    </div>
  )
}

export default PageLayout
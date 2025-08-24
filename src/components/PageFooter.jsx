const PageFooter = ({
  showBtn1 = false,
  showBtn2 = false,
  showBtn3 = false,
  btn1Text = '',
  btn2Text = '',
  btn3Text = '',
  onBtn1Click,
  onBtn2Click,
  onBtn3Click
}) => {
  return (
    <div className="mt-12 pt-6 border-t flex flex-col md:flex-row gap-4 justify-end">
      {showBtn1 && (
        <button
          onClick={onBtn1Click}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {btn1Text}
        </button>
      )}
      {showBtn2 && (
        <button
          onClick={onBtn2Click}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {btn2Text}
        </button>
      )}
      {showBtn3 && (
        <button
          onClick={onBtn3Click}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {btn3Text}
        </button>
      )}
    </div>
  )
}

export default PageFooter
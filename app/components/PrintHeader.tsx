export default function PrintHeader() {
  return (
    <div className="print-header" aria-hidden="true">
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <td style={{ width: '55%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>Supplier</div>
            </td>
            <td style={{ width: '45%', verticalAlign: 'top', border: '1px solid #000', padding: '12px' }}>
              <table style={{ width: '100%', border: 'none' }}>
                <tbody>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Quotation No</strong></td><td style={{ border: 'none', padding: '4px 0' }}>ARQT/23-24/0098</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Date</strong></td><td style={{ border: 'none', padding: '4px 0' }}>2/4/2026</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Buyer&apos;s Enquiry No</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Payment</strong></td><td style={{ border: 'none', padding: '4px 0' }}>0 Days / Direct Credit</td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Inco Terms</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
                  <tr><td style={{ border: 'none', padding: '4px 0' }}><strong>Terms Of Delivery</strong></td><td style={{ border: 'none', padding: '4px 0' }}></td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

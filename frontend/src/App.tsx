import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  userId: string;
  balanceKopecks: number;
  balanceLira: number;
  currency: string;
  country: string;
  city: string;
  timezone: string;
}

interface Transaction {
  id: string;
  type: 'PAYIN' | 'PAYOUT';
  provider: string;
  amountKopecks: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethod {
  method: string;
  name: string;
  enabled: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [payoutMethod, setPayoutMethod] = useState('papara');
  const [recipientName, setRecipientName] = useState('Test User');
  const [firstName, setFirstName] = useState('Test');
  const [lastName, setLastName] = useState('User');
  const [selectedProvider] = useState('decard'); // Только DeCard
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [resultType, setResultType] = useState<'success' | 'error' | ''>('');
  const [activeTab, setActiveTab] = useState<'payin' | 'payout'>('payin');

  const API_URL = 'http://localhost:3000';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    fetchUser();
    fetchTransactions();
    fetchPaymentMethods();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/users/default`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions?userId=${DEFAULT_USER_ID}`);
      const data = await response.json();
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${API_URL}/providers/decard/methods/TRY`);
      const data = await response.json();
      setPaymentMethods(data.methods || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const createPayin = async () => {
    if (!amount) return;
    
    setLoading(true);
    setResult('');
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          amountKopecks: Math.round(parseFloat(amount) * 100),
          paymentMethod: paymentMethod,
          firstName: firstName,
          lastName: lastName,
          userId: DEFAULT_USER_ID
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(`✅ Пополнение создано! Переходите по ссылке для оплаты`);
        setResultType('success');
        
        // Открываем ссылку на оплату в новом окне
        if (data.redirectUrl) {
          window.open(data.redirectUrl, '_blank');
        }
        
        // Обновляем данные
        setTimeout(() => {
          fetchUser();
          fetchTransactions();
        }, 1000);
      } else {
        setResult(`❌ Ошибка: ${data.message || 'Не удалось создать пополнение'}`);
        setResultType('error');
      }
    } catch (error) {
      setResult('❌ Ошибка сети: Не удается подключиться к API');
      setResultType('error');
    }
    setLoading(false);
  };

  const createPayout = async () => {
    if (!amount || !cardNumber) {
      setResult('❌ Укажите сумму и номер карты для вывода');
      setResultType('error');
      return;
    }
    
    setLoading(true);
    setResult('');
    try {
      const response = await fetch(`${API_URL}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          amountKopecks: Math.round(parseFloat(amount) * 100),
          paymentAccount: cardNumber,
          payoutMethod: payoutMethod,
          recipientName: recipientName
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(`✅ Вывод создан! Статус: ${data.status}, ID: ${data.id}`);
        setResultType('success');
        
        // Обновляем данные
        setTimeout(() => {
          fetchUser();
          fetchTransactions();
        }, 1000);
      } else {
        setResult(`❌ Ошибка: ${data.message || 'Не удалось создать вывод'}`);
        setResultType('error');
      }
    } catch (error) {
      setResult('❌ Ошибка сети: Не удается подключиться к API');
      setResultType('error');
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatAmount = (kopecks: number, currency: string) => {
    return `${(kopecks / 100).toFixed(2)} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#38ef7d';
      case 'pending': return '#f39c12';
      case 'progress': return '#3498db';
      case 'failed': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Интеграция платёжной системы</h1>
        </div>

        <div className="grid">
          {/* Баланс пользователя */}
          {user && (
            <div className="card user-info">
              <h2>💰 Баланс</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Пользователь</div>
                  <div className="info-value">{user.userId}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Текущий баланс</div>
                  <div className="info-value balance">{user.balanceLira} {user.currency}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Локация</div>
                  <div className="info-value">{user.city}, {user.country}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Провайдер</div>
                  <div className="info-value">DeCard</div>
                </div>
              </div>
            </div>
          )}

          {/* Операции с вкладками */}
          <div className="card payment-section">
            <h2>💳 Операции</h2>
            
            {/* Вкладки */}
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'payin' ? 'active' : ''}`}
                onClick={() => setActiveTab('payin')}
              >
                💳 Пополнение
              </button>
              <button 
                className={`tab ${activeTab === 'payout' ? 'active' : ''}`}
                onClick={() => setActiveTab('payout')}
              >
                💸 Вывод
              </button>
            </div>

            {/* Контент вкладки пополнения */}
            {activeTab === 'payin' && (
              <div className="tab-content">
                <div className="input-group">
                  <label>Метод платежа:</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="card">Карта</option>
                    <option value="papara">Papara</option>
                    <option value="online_bank_transfer">Банковский перевод</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label>Имя:</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Test"
                    />
                  </div>
                  <div className="input-group">
                    <label>Фамилия:</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="User"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Сумма ({user?.currency || 'TRY'}):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                    step="0.01"
                    min="0.01"
                  />
                  <div className="test-amounts">
                    <small>🧪 Тестовые суммы DeCard:</small>
                    <div className="test-buttons">
                      <button type="button" onClick={() => setAmount('100')} className="test-btn">
                        100₺ - success
                      </button>
                      <button type="button" onClick={() => setAmount('599')} className="test-btn">
                        599₺ - error
                      </button>
                      <button type="button" onClick={() => setAmount('1299')} className="test-btn">
                        1299₺ - mismatch
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={createPayin}
                  disabled={loading || !amount}
                  className="btn btn-primary btn-full"
                >
                  {loading ? '🔄 Загрузка...' : '💳 Пополнить счёт'}
                </button>
              </div>
            )}

            {/* Контент вкладки вывода */}
            {activeTab === 'payout' && (
              <div className="tab-content">
                <div className="input-group">
                  <label>Метод вывода:</label>
                  <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
                    <option value="papara">Papara</option>
                    <option value="bank-transfer">Банковский перевод</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Имя получателя:</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Test User"
                  />
                </div>

                <div className="input-group">
                  <label>
                    {payoutMethod === 'papara' ? 'Papara номер:' : 'IBAN банковского счета:'}
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder={
                      payoutMethod === 'papara' 
                        ? 'Номер Papara (например: 123456789)' 
                        : 'IBAN (например: TR470001500158007354227908)'
                    }
                  />
                  <div className="test-amounts">
                    <small>
                      💡 {payoutMethod === 'papara' 
                        ? 'Введите 11-значный номер Papara счета' 
                        : 'Введите IBAN банковского счета (TR + 24 цифры)'}
                    </small>
                    <div className="test-buttons">
                      {payoutMethod === 'papara' ? (
                        <>
                          <button type="button" onClick={() => setCardNumber('123456789')} className="test-btn">
                            123456789 - тестовый Papara
                          </button>
                          <button type="button" onClick={() => setCardNumber('987654321')} className="test-btn">
                            987654321 - альтернативный Papara
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => setCardNumber('TR470001500158007354227908')} className="test-btn">
                            TR47... - тестовый IBAN
                          </button>
                          <button type="button" onClick={() => setCardNumber('TR330006100519786457841326')} className="test-btn">
                            TR33... - альтернативный IBAN
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Сумма вывода ({user?.currency || 'TRY'}):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50.00"
                    step="0.01"
                    min="0.01"
                    max={user ? (user.balanceKopecks / 100).toString() : undefined}
                  />
                  {user && (
                    <small>💰 Доступно: {(user.balanceKopecks / 100).toFixed(2)} {user.currency}</small>
                  )}
                </div>

                <button 
                  onClick={createPayout}
                  disabled={loading || !amount || !cardNumber || !recipientName}
                  className="btn btn-secondary btn-full"
                >
                  {loading ? '🔄 Загрузка...' : '💸 Вывести средства'}
                </button>
              </div>
            )}

            {result && (
              <div className={`result ${resultType}`}>
                <p>{result}</p>
              </div>
            )}
          </div>
        </div>

        {/* История транзакций */}
        <div className="card">
          <h2>📊 История транзакций</h2>
          {transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-type">
                      {transaction.type === 'PAYIN' ? '⬇️ Пополнение' : '⬆️ Вывод'}
                    </div>
                    <div className="transaction-amount">
                      {formatAmount(transaction.amountKopecks, user?.currency || 'TRY')}
                    </div>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-status" style={{ color: getStatusColor(transaction.status) }}>
                      {transaction.status}
                    </div>
                    <div className="transaction-date">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-transactions">
              <p>Транзакций пока нет</p>
            </div>
          )}
        </div>

        {/* Доступные методы оплаты */}
        {paymentMethods.length > 0 && (
          <div className="card">
            <h2>💳 Доступные методы оплаты</h2>
            <div className="payment-methods">
              {paymentMethods.map((method, index) => (
                <div key={index} className="payment-method">
                  {method.enabled ? '✅' : '❌'} {method.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

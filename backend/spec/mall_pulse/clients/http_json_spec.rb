# frozen_string_literal: true

RSpec.describe MallPulse::Clients::HttpJson do
  let(:uri) { URI('https://example.test/x') }

  def stub_resposta(resposta)
    http = instance_double(Net::HTTP)
    allow(http).to receive(:request).and_return(resposta)
    allow(Net::HTTP).to receive(:start).and_yield(http)
  end

  it 'retorna o JSON em respostas 2xx' do
    resposta = Net::HTTPOK.new('1.1', '200', 'OK')
    allow(resposta).to receive(:body).and_return('{"a":1}')
    stub_resposta(resposta)

    expect(described_class.get(uri)).to eq('a' => 1)
  end

  it 'retorna nil em respostas não 2xx' do
    stub_resposta(Net::HTTPInternalServerError.new('1.1', '500', 'err'))

    expect(described_class.get(uri)).to be_nil
  end

  it 'retorna nil em timeout' do
    allow(Net::HTTP).to receive(:start).and_raise(Net::OpenTimeout)

    expect(described_class.get(uri)).to be_nil
  end

  it 'usa timeout de 3s' do
    allow(Net::HTTP).to receive(:start).and_raise(Net::OpenTimeout)
    described_class.get(uri)

    expect(Net::HTTP).to have_received(:start).with('example.test', 443,
                                                    hash_including(open_timeout: 3, read_timeout: 3))
  end
end

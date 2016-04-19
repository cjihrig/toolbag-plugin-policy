'use strict';

const Module = require('module');
const Code = require('code');
const Lab = require('lab');
const Manager = require('toolbag/lib/manager');
const Policy = require('../lib');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

const load = Module._load;
const binding = process.binding;

describe('Policy', () => {
  lab.afterEach((done) => {
    Module._load = load;
    process.binding = binding;
    done();
  });

  it('blacklists core modules', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { modules: { fs: 'throw' } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('fs');
      }).to.throw(Error, 'use of blacklisted module: fs');
      done();
    });
  });

  it('blacklists npm modules', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { modules: { 'belly-button': 'throw' } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('belly-button');
      }).to.throw(Error, 'use of blacklisted module: belly-button');
      done();
    });
  });

  it('allows modules that are not on the blacklist', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { modules: {} } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('util');
      }).to.not.throw();
      done();
    });
  });

  it('uses default error handler if module has invalid handler', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { modules: { fs: 'foo' } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('fs');
      }).to.throw(Error, 'use of blacklisted module: fs');
      done();
    });
  });

  it('blacklists bindings', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { bindings: { natives: 'throw' } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        process.binding('natives');
      }).to.throw(Error, 'use of blacklisted binding: natives');
      done();
    });
  });

  it('allows bindings that are not on the blacklist', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { bindings: {} } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        process.binding('natives');
      }).to.not.throw();
      done();
    });
  });

  it('uses default error handler if binding has invalid handler', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { bindings: { natives: 'foo' } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        process.binding('natives');
      }).to.throw(Error, 'use of blacklisted binding: natives');
      done();
    });
  });

  it('ignores blacklists that aren\'t objects', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { modules: null, bindings: null } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      done();
    });
  });

  it('blacklists methods', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { modules: { fs: { existsSync: 'throw' } } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('fs').existsSync('foo');
      }).to.throw(Error, 'use of blacklisted method: fs.existsSync');
      done();
    });
  });

  it('allows methods that are not on the blacklist', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { modules: { fs: { existsSync: 'throw' } } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('fs').accessSync(__filename);
      }).to.not.throw();
      done();
    });
  });

  it('calls original method if error policy allows it', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { modules: { fs: { accessSync: 'swallow' } } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('fs').accessSync(__filename);
      }).to.not.throw();
      done();
    });
  });

  it('ignores method blacklists that aren\'t objects', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { modules: { path: null } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('path').join('foo', 'bar');
      }).to.not.throw();
      done();
    });
  });

  it('ignores blacklisted methods that aren\'t methods', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { modules: { dns: { ADDRCONFIG: 'throw' } } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('dns').ADDRCONFIG;
      }).to.not.throw();
      done();
    });
  });

  it('uses default error handler if method has invalid handler', (done) => {
    const manager = new Manager({ errors: { policy: 'throw' } });
    const options = { blacklist: { modules: { path: { resolve: 'foo' } } } };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      expect(() => {
        require('path').resolve('bar', 'baz');
      }).to.throw(Error, 'use of blacklisted method: path.resolve');
      done();
    });
  });

  it('registers policy-get-blacklist command', (done) => {
    const manager = new Manager({ errors: { policy: 'swallow' } });
    const options = { blacklist: { modules: { child_process: 'throw' } } };
    const respond = manager.client.respond;

    manager.client.respond = function (message, callback) {
      manager.client.respond = respond;
      expect(message.payload.data).to.deep.equal(options.blacklist);
      done();
    };

    Policy.register(manager, options, (err) => {
      expect(err).to.not.exist();
      manager.execute({
        command: 'policy-get-blacklist',
        options: {}
      });
    });
  });
});
